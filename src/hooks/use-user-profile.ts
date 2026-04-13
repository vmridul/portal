"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";

interface UseUserProfileActionsResult {
  changeName: (username: string) => Promise<void>;
  changeAvatar: (avatarUrl: string) => Promise<void>;
  generateUploadUrl: () => Promise<string>;
  getUrl: (storageId: string) => Promise<string | null>;
}

export function useUserProfileActions(): UseUserProfileActionsResult {
  const changeNameMutation = useMutation(api.users.changeName);
  const changeAvatarMutation = useMutation(api.users.changeAvatar);
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl);
  const getUrlMutation = useMutation(api.storage.getUrlMutation);

  const changeName = useCallback(
    async (username: string) => {
      await changeNameMutation({ username });
    },
    [changeNameMutation]
  );

  const changeAvatar = useCallback(
    async (avatarUrl: string) => {
      await changeAvatarMutation({ avatarUrl });
    },
    [changeAvatarMutation]
  );

  const generateUploadUrl = useCallback(async () => {
    const url = await generateUploadUrlMutation();
    return url;
  }, [generateUploadUrlMutation]);

  const getUrl = useCallback(
    async (storageId: string) => {
      const result = await getUrlMutation({ storageId: storageId as Id<"_storage"> });
      return result ?? null;
    },
    [getUrlMutation]
  );

  return {
    changeName,
    changeAvatar,
    generateUploadUrl,
    getUrl,
  };
}