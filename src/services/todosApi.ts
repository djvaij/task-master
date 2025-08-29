import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TodoStatus } from "../types/todo";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  status?: Todo["status"];
  order?: number;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  status?: Todo["status"];
  order?: number;
}

export const todosApi = createApi({
  reducerPath: "todosApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL as string,
  }),
  tagTypes: ["Todos"],
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void>({
      query: () => `/todos`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Todos" as const, id })),
              { type: "Todos" as const, id: "LIST" },
            ]
          : [{ type: "Todos" as const, id: "LIST" }],
    }),
    createTodo: builder.mutation<Todo, CreateTodoDto>({
      query: (body) => ({
        url: `/todos`,
        method: "POST",
        body: { status: "todo", order: Date.now(), ...body },
      }),
      invalidatesTags: [{ type: "Todos", id: "LIST" }],
    }),
    updateTodo: builder.mutation<Todo, { id: string; changes: UpdateTodoDto }>({
      query: ({ id, changes }) => ({
        url: `/todos/${id}`,
        method: "PUT",
        body: changes,
      }),
      // Optimistic update via onQueryStarted
      async onQueryStarted({ id, changes }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          todosApi.util.updateQueryData("getTodos", undefined, (draft) => {
            const idx = draft.findIndex((t) => t.id === id);
            if (idx !== -1) {
              draft[idx] = { ...draft[idx], ...changes };
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, arg) => [{ type: "Todos", id: arg.id }],
    }),
    deleteTodo: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/todos/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Todos", id },
        { type: "Todos", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todosApi;
