import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useGameStateStore } from "@/store/game-state-store";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "../ui/input";
import { createPlayer } from "@/services/player-serivce";
export const LoginForm = () => {
  const form = useForm();
  const gameStateStore = useGameStateStore();
  const authStore = useAuthStore();

  const onSubmit = async () => {
    gameStateStore.setHasStarted(true);
    const { username } = form.getValues();

    const { player, token } = await createPlayer({ username });

    if (token) authStore.setToken(token);

    authStore.setPlayer(player);
  };

  return (
    <div className="bg-white p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center gap-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-2xl text-black">Username</FormLabel>
                <FormControl>
                  <Input placeholder="type your username" className="text-2xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="bg-[#a3dbf2] border border-black p-4 text-2xl cursor-pointer text-black hover:opacity-90"
            onClick={onSubmit}
          >
            Start Game
          </Button>
        </form>
      </Form>
    </div>
  );
};
