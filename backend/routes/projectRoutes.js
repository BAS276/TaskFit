const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all projects with progress
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('team');
    const projectsWithProgress = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'Done').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project._doc,
        progress,
      };
    }));
    res.json(projectsWithProgress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a project
router.post('/', async (req, res) => {
  const project = new Project({
    name: req.body.name,
    status: req.body.status,
    team: req.body.team || [],
  });
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.name = req.body.name || project.name;
    project.status = req.body.status || project.status;
    project.team = req.body.team || project.team;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: project._id }); // Delete associated tasks
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;