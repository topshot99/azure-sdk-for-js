// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import type { PartitionKey } from "../../documents/index.js";
import type { FeedRange } from "./FeedRange.js";
import { ChangeFeedStartFromNow } from "./ChangeFeedStartFromNow.js";
import { ChangeFeedStartFromBeginning } from "./ChangeFeedStartFromBeginning.js";
import { ChangeFeedStartFromTime } from "./ChangeFeedStartFromTime.js";
import { ChangeFeedStartFromContinuation } from "./ChangeFeedStartFromContinuation.js";
import { ErrorResponse } from "../../request/ErrorResponse.js";
import { isNullOrEmpty } from "./changeFeedUtils.js";

/**
 * Base class for where to start a ChangeFeedIterator.
 */
/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class ChangeFeedStartFrom {
  /**
   * Returns an object that tells the ChangeFeedIterator to start from the beginning of time.
   * @param cfResource - PartitionKey or FeedRange for which changes are to be fetched. Leave blank for fetching changes for entire container.
   */
  public static Beginning(cfResource?: PartitionKey | FeedRange): ChangeFeedStartFromBeginning {
    return new ChangeFeedStartFromBeginning(cfResource);
  }
  /**
   *  Returns an object that tells the ChangeFeedIterator to start reading changes from this moment onward.
   * @param cfResource - PartitionKey or FeedRange for which changes are to be fetched. Leave blank for fetching changes for entire container.
   **/
  public static Now(cfResource?: PartitionKey | FeedRange): ChangeFeedStartFromNow {
    return new ChangeFeedStartFromNow(cfResource);
  }
  /**
   * Returns an object that tells the ChangeFeedIterator to start reading changes from some point in time onward.
   * @param startTime - Date object specfiying the time to start reading changes from.
   * @param cfResource - PartitionKey or FeedRange for which changes are to be fetched. Leave blank for fetching changes for entire container.
   */
  public static Time(
    startTime: Date,
    cfResource?: PartitionKey | FeedRange,
  ): ChangeFeedStartFromTime {
    if (!startTime) {
      throw new ErrorResponse("startTime must be present");
    }
    if (startTime instanceof Date === true) {
      return new ChangeFeedStartFromTime(startTime, cfResource);
    } else {
      throw new ErrorResponse("startTime must be a Date object.");
    }
  }
  /**
   * Returns an object that tells the ChangeFeedIterator to start reading changes from a save point.
   * @param continuation - The continuation to resume from.
   */
  public static Continuation(continuationToken: string): ChangeFeedStartFromContinuation {
    if (!continuationToken) {
      throw new ErrorResponse("Argument continuation must be passed.");
    }
    if (isNullOrEmpty(continuationToken)) {
      throw new ErrorResponse("Argument continuationToken must be a non-empty string.");
    }
    return new ChangeFeedStartFromContinuation(continuationToken);
  }
}
