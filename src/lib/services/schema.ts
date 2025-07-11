import { Schema } from "effect";

export class ShareChatRequest extends Schema.Class<ShareChatRequest>("ShareChatRequest")({
    youtubeId: Schema.String,
    userVideoId: Schema.Number,
}) { }

export class ShareChatResponse extends Schema.Class<ShareChatResponse>("ShareChatResponse")({
    url: Schema.String,
}) { }

export class ClearMessagesRequest extends Schema.Class<ClearMessagesRequest>("ClearMessagesRequest")({
    userVideoId: Schema.Number,
}) { }

export class ClearMessagesResponse extends Schema.Class<ClearMessagesResponse>("ClearMessagesResponse")({
    success: Schema.Boolean,
}) { }

export class VideoSearchRequest extends Schema.Class<VideoSearchRequest>("VideoSearchRequest")({
    q: Schema.String,
}) { }

export class VideoSearchItem extends Schema.Class<VideoSearchItem>("VideoSearchItem")({
    id: Schema.String,
    title: Schema.String,
    description: Schema.String,
    thumbnails: Schema.Array(Schema.Struct({
        url: Schema.String,
        width: Schema.Number,
        height: Schema.Number,
    })),
    published: Schema.String,
    view_count: Schema.String,
    duration: Schema.String,
    author: Schema.Struct({
        id: Schema.String,
        name: Schema.String,
    }),
}) { }

export class VideoSearchResponse extends Schema.Class<VideoSearchResponse>("VideoSearchResponse")({
    data: Schema.Array(VideoSearchItem),
}) { }