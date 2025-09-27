"""
Device-aware acceleration layer for Physics MCP Python Worker.

Provides optional GPU acceleration using PyTorch for numerical sampling in plotting
functions. Falls back to CPU/Numpy when unavailable or unsupported.

Environment toggles:
- ACCEL_MODE: 'auto' | 'gpu' | 'cpu' (default: 'auto')
- ACCEL_DEVICE: 'auto' | 'cuda' | 'mps' | 'xpu' (default: 'auto')

Capabilities can be queried via accel_caps().
"""
from __future__ import annotations

import os
import sys
from typing import Tuple, Optional

try:
    import torch  # type: ignore
except Exception:  # pragma: no cover
    torch = None  # type: ignore

import sympy as sp
import numpy as np


def _detect_device() -> Tuple[bool, str, str]:
    mode = os.getenv("ACCEL_MODE", "auto").lower()
    prefer = os.getenv("ACCEL_DEVICE", "auto").lower()

    if torch is None:
        return False, "cpu", mode

    # If forced CPU
    if mode == "cpu":
        return False, "cpu", mode

    # Figure out available backends
    cuda_ok = hasattr(torch, "cuda") and torch.cuda.is_available()
    mps_ok = hasattr(torch.backends, "mps") and torch.backends.mps.is_available()  # type: ignore
    xpu_ok = hasattr(torch, "xpu") and hasattr(torch.xpu, "is_available") and torch.xpu.is_available()  # type: ignore

    # Resolve device preference order
    candidates = []
    if prefer == "auto":
        candidates = [("cuda", cuda_ok), ("mps", mps_ok), ("xpu", xpu_ok)]
    else:
        candidates = [
            (prefer, (prefer == "cuda" and cuda_ok) or (prefer == "mps" and mps_ok) or (prefer == "xpu" and xpu_ok))
        ]

    for name, ok in candidates:
        if ok:
            return True, name, mode

    # No GPU available
    return False, "cpu", mode


_ACTIVE = False
_DEVICE = "cpu"
_MODE = "cpu"


def accel_init() -> dict:
    global _ACTIVE, _DEVICE, _MODE
    _ACTIVE, _DEVICE, _MODE = _detect_device()
    return accel_caps()


def accel_caps() -> dict:
    return {
        "active": _ACTIVE,
        "device": _DEVICE,
        "mode": _MODE,
        "has_torch": bool(torch is not None),
    }


def _torch_device() -> Optional["torch.device"]:
    if torch is None:
        return None
    if not _ACTIVE:
        return None
    if _DEVICE == "cuda":
        return torch.device("cuda")
    if _DEVICE == "mps":
        return torch.device("mps")
    if _DEVICE == "xpu":
        # Some PyTorch builds have torch.xpu
        try:
            return torch.device("xpu")
        except Exception:
            return None
    return None


def _to_numpy(tensor: "torch.Tensor") -> np.ndarray:
    return tensor.detach().to("cpu").numpy()


def _oom_wrap(fn):
    def _inner(*args, **kwargs):
        if torch is None or not _ACTIVE:
            raise RuntimeError("ACCEL inactive")
        try:
            return fn(*args, **kwargs)
        except Exception as e:  # catch device errors
            # Friendly fallback triggers
            msg = str(e)
            if "out of memory" in msg.lower() or e.__class__.__name__ in ("OutOfMemoryError",):
                raise MemoryError(
                    "GPU out of memory during accelerated sampling. Reduce grid size or set ACCEL_MODE=cpu."
                )
            # Unsupported op/dtype
            raise
    return _inner


@_oom_wrap
def accel_eval_parametric_1d(x_expr: sp.Expr, y_expr: sp.Expr, t_min: float, t_max: float, samples: int):
    dev = _torch_device()
    if dev is None:
        raise RuntimeError("ACCEL device not available")
    t = torch.linspace(float(t_min), float(t_max), int(samples), device=dev, dtype=torch.float32)
    t_sym = sp.Symbol("t")
    try:
        x_f = sp.lambdify(t_sym, x_expr, "torch")
        y_f = sp.lambdify(t_sym, y_expr, "torch")
        x_vals = x_f(t)
        y_vals = y_f(t)
        return _to_numpy(x_vals), _to_numpy(y_vals)
    except Exception as e:
        # Unsupported in torch backend
        raise RuntimeError(f"ACCEL torch lambdify failed: {e}")


@_oom_wrap
def accel_eval_scalar_2d(f_expr: sp.Expr, x_min: float, x_max: float, y_min: float, y_max: float, samples: int):
    dev = _torch_device()
    if dev is None:
        raise RuntimeError("ACCEL device not available")
    x = torch.linspace(float(x_min), float(x_max), int(samples), device=dev, dtype=torch.float32)
    y = torch.linspace(float(y_min), float(y_max), int(samples), device=dev, dtype=torch.float32)
    # indexing='xy' to match numpy semantics
    X, Y = torch.meshgrid(x, y, indexing='xy')  # type: ignore[arg-type]
    x_sym, y_sym = sp.symbols('x y')
    try:
        f = sp.lambdify((x_sym, y_sym), f_expr, "torch")
        Z = f(X, Y)
        return _to_numpy(X), _to_numpy(Y), _to_numpy(Z)
    except Exception as e:
        raise RuntimeError(f"ACCEL torch lambdify failed: {e}")


@_oom_wrap
def accel_eval_vector_2d(fx_expr: sp.Expr, fy_expr: sp.Expr, x_min: float, x_max: float, y_min: float, y_max: float, grid_points: int):
    dev = _torch_device()
    if dev is None:
        raise RuntimeError("ACCEL device not available")
    x = torch.linspace(float(x_min), float(x_max), int(grid_points), device=dev, dtype=torch.float32)
    y = torch.linspace(float(y_min), float(y_max), int(grid_points), device=dev, dtype=torch.float32)
    X, Y = torch.meshgrid(x, y, indexing='xy')  # type: ignore[arg-type]
    x_sym, y_sym = sp.symbols('x y')
    try:
        fx = sp.lambdify((x_sym, y_sym), fx_expr, "torch")
        fy = sp.lambdify((x_sym, y_sym), fy_expr, "torch")
        FX = fx(X, Y)
        FY = fy(X, Y)
        return _to_numpy(X), _to_numpy(Y), _to_numpy(FX), _to_numpy(FY)
    except Exception as e:
        raise RuntimeError(f"ACCEL torch lambdify failed: {e}")


@_oom_wrap
def accel_eval_scalar_3d(f_expr: sp.Expr, x_min: float, x_max: float, y_min: float, y_max: float, z_min: float, z_max: float, samples: int):
    dev = _torch_device()
    if dev is None:
        raise RuntimeError("ACCEL device not available")
    x = torch.linspace(float(x_min), float(x_max), int(samples), device=dev, dtype=torch.float32)
    y = torch.linspace(float(y_min), float(y_max), int(samples), device=dev, dtype=torch.float32)
    z = torch.linspace(float(z_min), float(z_max), int(samples), device=dev, dtype=torch.float32)
    # indexing='ij' to match numpy semantics for 3D
    X, Y, Z = torch.meshgrid(x, y, z, indexing='ij')  # type: ignore[arg-type]
    x_sym, y_sym, z_sym = sp.symbols('x y z')
    try:
        f = sp.lambdify((x_sym, y_sym, z_sym), f_expr, "torch")
        F = f(X, Y, Z)
        return _to_numpy(X), _to_numpy(Y), _to_numpy(Z), _to_numpy(F)
    except Exception as e:
        raise RuntimeError(f"ACCEL torch lambdify failed: {e}")
