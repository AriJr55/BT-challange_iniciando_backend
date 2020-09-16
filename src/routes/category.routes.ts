import { Router } from 'express';
import CreateCategoryService from '../services/CreateCategoryService';

const categoryRouter = Router();

categoryRouter.post('/', async (request, response) => {
  const categoryService = new CreateCategoryService();

  const title = request.body;

  try {
    const category = await categoryService.execute(title);

    return response.json(category);
  } catch (err) {
    return response.status(401).json({ error: err.message });
  }
});

export default categoryRouter;
