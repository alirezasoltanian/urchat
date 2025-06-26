import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { encryptKey } from "@/lib/encryption";
import { getModelsForProvider } from "@/lib/models";
import { currentUser } from "@/lib/actions/user";
import { user, userKeys } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      );
    }

    const userData = await currentUser();
    if (!userData?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { encrypted, iv } = encryptKey(apiKey);

    const existingKey = await db.query.userKeys.findFirst({
      where: (userKeys, { eq }) =>
        and(eq(userKeys.userId, userData.id), eq(userKeys.provider, provider)),
    });

    const isNewKey = !existingKey;

    await db
      .insert(userKeys)
      .values({
        userId: userData.id,
        provider,
        encryptedKey: encrypted,
        iv,
      })
      .onConflictDoUpdate({
        target: [userKeys.provider],
        set: {
          encryptedKey: encrypted,
          iv,
          updatedAt: new Date(),
        },
      });

    if (isNewKey) {
      try {
        const favoriteModels = (
          await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.id, userData.id),
          })
        )?.favoriteModels;

        const currentFavorites = favoriteModels || [];

        const providerModels = await getModelsForProvider(provider);
        const providerModelIds = providerModels.map((model) => model.id);

        if (providerModelIds.length > 0) {
          const newModelsToAdd = providerModelIds.filter(
            (modelId) => !currentFavorites.includes(modelId)
          );

          if (newModelsToAdd.length > 0) {
            const updatedFavorites = [...currentFavorites, ...newModelsToAdd];

            await db
              .update(user)
              .set({ favoriteModels: updatedFavorites })
              .where(eq(user.id, user.id));
          }
        }
      } catch (modelsError) {
        console.error("Failed to update favorite models:", modelsError);
      }
    }

    return NextResponse.json({
      success: true,
      isNewKey,
      message: isNewKey
        ? `API key saved and ${provider} models added to favorites`
        : "API key updated",
    });
  } catch (error) {
    console.error("Error in POST /api/user-keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(userKeys)
      .where(
        and(eq(userKeys.userId, user.id), eq(userKeys.provider, provider))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/user-keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
