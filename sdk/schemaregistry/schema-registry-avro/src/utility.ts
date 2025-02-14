// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { MessageContent } from "./models.js";

export function isMessageContent(message: unknown): message is MessageContent {
  const castMessage = message as MessageContent;
  return castMessage.data !== undefined && castMessage.contentType !== undefined;
}
