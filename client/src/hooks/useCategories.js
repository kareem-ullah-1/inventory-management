import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../services/categoryService";

export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryService.getCategories(params),
  });
};

export const useCategoryDetails = (id) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  });
};

export const useSaveCategory = (id = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      id ? categoryService.updateCategory(id, payload) : categoryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["categories", id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
