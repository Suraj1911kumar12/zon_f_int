import express, { Router, Response } from 'express';
import Task from '../models/Task';
import auth, { AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

router.post('/', auth, async (req: AuthRequest, res: Response) => {
  const { title, description, status, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ msg: 'Title is required' });
  }

  try {
    const existingTask = await Task.findOne({
      user: req.user?.id,
      title: { $regex: new RegExp(`^${title.trim()}$`, 'i') }
    });

    if (existingTask) {
      return res.status(400).json({ msg: 'A task with this title already exists' });
    }

    const task = new Task({
      title: title.trim(),
      description,
      status,
      dueDate,
      user: req.user?.id
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const query: any = { user: req.user?.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  const { title, description, status, dueDate } = req.body;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.user.toString() !== req.user?.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (title && title.trim() !== task.title) {
      const existingTask = await Task.findOne({
        user: req.user?.id,
        title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingTask) {
        return res.status(400).json({ msg: 'A task with this title already exists' });
      }
      task.title = title.trim();
    }

    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    await task.save();
    res.json(task);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.user.toString() !== req.user?.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Task removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
