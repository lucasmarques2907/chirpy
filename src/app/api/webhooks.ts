import { Request, Response } from "express";
import { upgradeUserMembership } from "../../db/queries/users.js";
import { NotFoundError } from "./errors.js";

export async function handlerWebook(req: Request, res: Response) {
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
