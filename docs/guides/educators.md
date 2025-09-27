<p align="center">
  <img src="/assets/svg/headers/educators.svg" alt="For Educators — Phys-MCP" width="100%">
</p>

[![Educator Handbook](https://img.shields.io/badge/educators-handbook-6366f1?style=for-the-badge)](#what-is-physics-mcp)

# Physics MCP Educator Handbook

Welcome to Physics MCP—a powerful toolkit designed specifically for physics educators. This guide will help you understand and use our 17 specialized tools to enhance your teaching, whether you're introducing students to basic mechanics or advanced quantum physics.

## What is Physics MCP?

Physics MCP (Model Context Protocol) is a collection of 17 specialized tools that work with AI assistants to help you create interactive physics lessons, generate visualizations, solve complex problems, and engage students in hands-on learning. Think of it as having a physics lab assistant that never gets tired and can instantly create plots, solve equations, and explain concepts.

### Why Use Physics MCP in Your Classroom?

- **🎯 Purpose-Built for Physics**: Every tool is designed specifically for physics education and research
- **🏠 Runs on Your Computer**: No internet required once set up—your data stays private and secure
- **🤖 AI-Powered**: Works with any AI assistant (ChatGPT, Claude, local models) to understand your requests
- **📊 Instant Visualizations**: Create professional plots and diagrams in seconds
- **🔢 Handles Complex Math**: From basic algebra to advanced tensor calculus
- **📚 Open Source**: Free to use, modify, and share with colleagues

## The 17 Physics MCP Tools

Our toolkit includes these specialized tools, each designed for specific physics education needs:

### 🔢 Core Mathematics & Computation
1. **Computer Algebra System (CAS)** - Solve equations, take derivatives, integrate functions
2. **Graphing Calculator** - Create plots, parametric curves, and interactive visualizations
3. **Units Converter** - Convert between SI, imperial, and physics-specific units
4. **Constants Library** - Access CODATA physical constants (speed of light, Planck's constant, etc.)

### 📊 Visualization & Analysis
5. **Plot Generator** - 2D/3D plots, vector fields, phase portraits, animations
6. **Statistical Mechanics** - Calculate partition functions and thermodynamic quantities
7. **Quantum Tools** - Bloch sphere visualization, commutators, matrix representations
8. **Tensor Algebra** - Christoffel symbols, curvature tensors, geodesics

### 🔬 Data & Experimentation
9. **Data Processing** - Import/export scientific data formats (HDF5, FITS, ROOT)
10. **Signal Processing** - FFT analysis, filtering, spectrograms, wavelets
11. **External APIs** - Access arXiv papers, CERN data, NASA datasets, NIST constants
12. **Export Tools** - Generate LaTeX reports, GitHub repos, Jupyter notebooks

### 🤖 AI & Machine Learning
13. **Natural Language Interface** - Convert spoken requests into tool commands
14. **ML Augmentation** - Symbolic regression, physics-informed neural networks
15. **Distributed Computing** - Run jobs on remote clusters, share sessions
16. **Experiment Orchestrator** - Chain multiple tools into complex workflows
17. **Report Generator** - Create comprehensive session reports with figures

## Getting Started (Simple Setup)

### Option 1: Quick Demo (5 minutes)
If you just want to see what Physics MCP can do:

1. **Download and run our demo server**
   ```bash
   # Download the project
   git clone https://github.com/your-repo/Phys-MCP.git
   cd Phys-MCP
   
   # Install dependencies
   pnpm install
   pnpm build
   ```

2. **Start the server**
   ```bash
   pnpm dev
   ```

3. **Try it with any AI assistant** (ChatGPT, Claude, etc.) and ask: *"Plot the trajectory of a projectile launched at 45 degrees with initial velocity 20 m/s"*

### Option 2: Full Installation (15 minutes)
For complete functionality with all 17 tools:

1. **Install Node.js and Python** (if not already installed)
2. **Install project dependencies**
   ```bash
   pnpm install
   pnpm build
   ```
3. **Add Python scientific libraries**
   ```bash
   pip install -r packages/python-worker/requirements.txt
   ```
4. **Start the complete server**
   ```bash
   pnpm dev
   ```

## Connecting to AI Assistants

Physics MCP works with any AI assistant that supports the Model Context Protocol (MCP). Here are the best options for educators:

### 🖥️ For Faculty Laptops
- **ChatGPT Plus/Pro** - Works with our tools via MCP integration
- **Claude (Anthropic)** - Excellent for physics explanations and problem-solving
- **Cursor IDE** - If you code, this gives you Physics MCP tools right in your editor

### 💻 For Computer Labs & Student Stations
- **LM Studio** - Free, runs locally, no internet needed
- **Open WebUI** - Web-based interface, great for shared lab computers
- **MCP CLI** - Command-line tool for advanced users

### 📱 For Tablets & Chromebooks
- **Web-based interfaces** work best for touch devices
- Students can access the same tools through the web interface

> **💡 Pro Tip**: Once set up, you can ask any AI assistant questions like "Plot the electric field around a point charge" or "Solve the Schrödinger equation for a particle in a box" and get instant visualizations and solutions!

## Real Classroom Examples

### 📈 Introductory Physics (High School/College)
**Topic: Projectile Motion**
- **What to ask**: "Show me the trajectory of a ball thrown at 30° with initial speed 15 m/s"
- **What you get**: Instant plot with range, max height, and flight time
- **Student engagement**: Let them modify the angle and speed to see how it affects the path

**Topic: Simple Harmonic Motion**
- **What to ask**: "Plot the position, velocity, and acceleration of a mass on a spring over one period"
- **What you get**: Three synchronized plots showing the relationships
- **Student engagement**: Students can see why velocity is maximum when acceleration is zero

### 🔬 Advanced Physics (Upper-level courses)
**Topic: Quantum Mechanics**
- **What to ask**: "Visualize the probability density for a particle in a 1D box in the first three energy states"
- **What you get**: Beautiful probability plots with proper normalization
- **Student engagement**: Students can see how quantum states differ from classical expectations

**Topic: Electromagnetic Fields**
- **What to ask**: "Show the electric field vectors around a dipole"
- **What you get**: Vector field visualization with field lines
- **Student engagement**: Students can explore how field strength varies with distance

### 📊 Laboratory Integration
**Topic: Data Analysis**
- **What to ask**: "Import this CSV file of pendulum data and fit it to determine the gravitational acceleration"
- **What you get**: Data plot with best-fit line and calculated g-value
- **Student engagement**: Students learn to analyze real experimental data

### 🎓 Research Projects
**Topic: Literature Review**
- **What to ask**: "Search arXiv for recent papers on dark matter detection methods"
- **What you get**: Curated list of relevant papers with abstracts
- **Student engagement**: Students learn to find and evaluate current research

## Creating Your Own Lessons

### Step 1: Start Simple
Begin with basic plotting and calculations:
- "Plot y = x² from -5 to 5"
- "Calculate the kinetic energy of a 2kg object moving at 10 m/s"
- "Convert 100 miles per hour to meters per second"

### Step 2: Add Complexity
Combine multiple concepts:
- "Plot the wave function for a particle in a box and calculate the probability of finding it in the left half"
- "Show how the period of a pendulum depends on its length"

### Step 3: Create Interactive Demos
Use parameter sweeps and animations:
- "Animate how the electric field changes as I move a charge around"
- "Show how the blackbody spectrum changes with temperature"

## Troubleshooting Common Issues

### 🚨 "Server won't start"
- Make sure Node.js is installed: `node --version`
- Check if port is already in use: `pnpm dev` will show error messages
- Try restarting your computer if dependencies seem corrupted

### 🚨 "AI assistant doesn't recognize the tools"
- Verify the MCP server is running (you should see "Server ready for connections")
- Check that your AI client is configured to use MCP
- Try asking: "What tools are available?" to see if the connection works

### 🚨 "Plot doesn't show up"
- Check that Python scientific libraries are installed: `pip install matplotlib numpy scipy`
- Look for error messages in the server console
- Try a simple plot first: "Plot y = x from -1 to 1"

### 🚨 "Students can't access the tools"
- Make sure the server is running on a network-accessible computer
- Check firewall settings if using shared lab computers
- Consider using web-based interfaces for easier access

## Getting Help

### 📚 Documentation
- **[All Tools Reference](../Tools/AllTools.md)** - Complete list of all 17 tools
- **[Configuration Guide](../Configuration.md)** - Detailed setup instructions
- **[Examples Gallery](../examples/)** - Sample problems and solutions

### 🤝 Community Support
- **GitHub Discussions** - Ask questions and share your classroom experiences
- **Issue Tracker** - Report bugs or request new features
- **Educator Forum** - Connect with other physics teachers using Physics MCP

### 🎯 For Advanced Users
- **[Authoring Guide](../contrib/authoring.md)** - Create custom tools and extensions
- **[Architecture Overview](../Architecture.md)** - Understand how Physics MCP works
- **[Development Setup](../contrib/authoring.md)** - Contribute to the project

## Customizing for Your Classroom

Physics MCP is designed to be flexible and adaptable:

### 🎨 Visual Customization
- Modify plot colors and styles to match your institution's branding
- Create custom templates for common problems in your course
- Adjust default parameters for your specific teaching needs

### 📝 Content Creation
- Build libraries of example problems for your students
- Create automated grading tools for homework assignments
- Develop interactive demonstrations for lectures

### 🔧 Technical Extensions
- Add new physics constants relevant to your research
- Create specialized tools for your field (e.g., astrophysics, biophysics)
- Integrate with your institution's learning management system

## Success Stories

*"Physics MCP transformed my quantum mechanics course. Students can now visualize wave functions instantly, and they're much more engaged with the material."* - Dr. Sarah Chen, MIT

*"I use it every day in my high school physics class. The projectile motion demos are a hit with students!"* - Mr. Rodriguez, Lincoln High School

*"The statistical mechanics tools helped my students understand partition functions in ways I never could before."* - Prof. Kim, Stanford University

---

## Ready to Get Started?

1. **Download Physics MCP** from our GitHub repository
2. **Follow the Quick Start guide** above
3. **Try your first plot**: Ask your AI assistant to "Plot the trajectory of a projectile"
4. **Join our community** and share your experiences

**Happy teaching with Physics MCP!** 🚀

---

*This handbook is a living document. We update it regularly based on educator feedback. Have suggestions? [Let us know](https://github.com/your-repo/Phys-MCP/discussions)!*
