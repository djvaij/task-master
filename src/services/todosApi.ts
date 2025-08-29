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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const tempId = `temp-${Math.random().toString(36).slice(2)}`;
        const tempTodo: Todo = {
          id: tempId,
          title: arg.title,
          description: arg.description,
          status: arg.status ?? "todo",
          order: arg.order ?? Date.now(),
        };
        const patchResult = dispatch(
          todosApi.util.updateQueryData("getTodos", undefined, (draft) => {
            draft.push(tempTodo);
          })
        );
        try {
          const { data: created } = await queryFulfilled;
          // Replace temp with actual
          dispatch(
            todosApi.util.updateQueryData("getTodos", undefined, (draft) => {
              const idx = draft.findIndex((t) => t.id === tempId);
              if (idx !== -1) {
                draft[idx] = created;
              } else {
                draft.push(created);
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
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
      invalidatesTags: (_result, _error, arg) => [
        { type: "Todos", id: arg.id },
      ],
    }),
    deleteTodo: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/todos/${id}`, method: "DELETE" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          todosApi.util.updateQueryData("getTodos", undefined, (draft) => {
            const idx = draft.findIndex((t) => t.id === id);
            if (idx !== -1) {
              draft.splice(idx, 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, id) => [
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
