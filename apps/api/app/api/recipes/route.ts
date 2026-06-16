import { getRecipeList } from '@/services/recipes/recipes.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';

function toQueryObject(searchParams: URLSearchParams) {
  const query: Record<string, string | string[]> = {};

  searchParams.forEach((_, key) => {
    const values = searchParams.getAll(key);
    query[key] = values.length > 1 ? values : (values[0] ?? '');
  });

  return query;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipes = await getRecipeList(toQueryObject(searchParams));

    return jsonResponse(recipes);
  } catch (error) {
    return errorResponse(error);
  }
}

export function OPTIONS() {
  return optionsResponse();
}
