import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useGameStateStore } from "@/store/game-state-store";
import { Input } from "../ui/input";
export const LoginForm = () => {
  const form = useForm();
  const gameStateStore = useGameStateStore();

  const onSubmit = () => {
    gameStateStore.setHasStarted(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" className="text-2xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-[0xa3dbf2] p-4 text-2xl cursor-pointer"
          onClick={onSubmit}
        >
          Start Game
        </Button>
      </form>
    </Form>
  );
};
