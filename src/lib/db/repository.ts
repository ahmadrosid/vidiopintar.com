import { InferSelectModel } from "drizzle-orm";
import { user } from "./schema/auth";

export type User = InferSelectModel<typeof user>;
