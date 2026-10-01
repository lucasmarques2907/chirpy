import { Request, Response } from "express";
import { upgradeUserMembership } from "../../db/queries/users.js";
import { NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { getAPIKey } from "../../auth.js";
import { config } from "../../config.js";

export async function handlerWebook(req: Request, res: Response) {
    const apiKey = await getAPIKey(req);
    if (apiKey !== config.api.polkaKey) {
        throw new UserNotAuthenticatedError("Invalid API Key");
    }

    type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const params: parameters = req.body;

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const upgraded = await upgradeUserMembership(params.data.userId);

  if (!upgraded) {
    res.status(404).send();
    return;
  }

  res.status(204).send().end();
}
