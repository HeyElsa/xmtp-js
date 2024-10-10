import type { content } from "@xmtp/proto";

export class ContentTypeId {
  authorityId: string;

  typeId: string;

  versionMajor: number;

  versionMinor: number;

  constructor(obj: content.ContentTypeId) {
    this.authorityId = obj.authorityId;
    this.typeId = obj.typeId;
    this.versionMajor = obj.versionMajor;
    this.versionMinor = obj.versionMinor;
  }

  toString(): string {
    return `${this.authorityId}/${this.typeId}:${this.versionMajor}.${this.versionMinor}`;
  }

  static fromString(contentTypeString: string): ContentTypeId {
    const [idString, versionString] = contentTypeString.split(":");
    const [authorityId, typeId] = idString.split("/");
    const [major, minor] = versionString.split(".");
    return new ContentTypeId({
      authorityId,
      typeId,
      versionMajor: Number(major),
      versionMinor: Number(minor),
    });
  }

  sameAs(id: ContentTypeId): boolean {
    return this.authorityId === id.authorityId && this.typeId === id.typeId;
  }
}

export type EncodedContent<Parameters = Record<string, string>> = {
  type: ContentTypeId;
  parameters: Parameters;
  fallback?: string;
  compression?: number;
  content: Uint8Array;
};

export type ContentCodec<T = any> = {
  contentType: ContentTypeId;
  encode(content: T, registry: CodecRegistry<T>): EncodedContent;
  decode(content: EncodedContent, registry: CodecRegistry<T>): T;
  fallback(content: T): string | undefined;
  shouldPush: (content: T) => boolean;
};

/**
 * An interface implemented for accessing codecs by content type.
 * @deprecated
 */
export interface CodecRegistry<T = any> {
  codecFor(contentType: ContentTypeId): ContentCodec<T> | undefined;
}

export type CodecMap<T = any> = Map<string, ContentCodec<T>>;
