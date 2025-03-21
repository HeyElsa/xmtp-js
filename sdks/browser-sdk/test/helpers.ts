import {
  ContentTypeId,
  type ContentCodec,
  type EncodedContent,
} from "@xmtp/content-type-primitives";
import { v4 } from "uuid";
import { createWalletClient, http, toBytes } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Client } from "@/Client";
import type { ClientOptions } from "@/types";
import type { Signer } from "@/utils/signer";

const testEncryptionKey = window.crypto.getRandomValues(new Uint8Array(32));

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createUser = () => {
  const key = generatePrivateKey();
  const account = privateKeyToAccount(key);
  return {
    key,
    account,
    wallet: createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    }),
    uuid: v4(),
  };
};

export const createSigner = (user: User): Signer => {
  return {
    type: "EOA",
    getIdentifier: () => ({
      identifier: user.account.address.toLowerCase(),
      identifierKind: "Ethereum",
    }),
    signMessage: async (message: string) => {
      const signature = await user.wallet.signMessage({
        message,
      });
      return toBytes(signature);
    },
  };
};

export type User = ReturnType<typeof createUser>;

export const createClient = async (signer: Signer, options?: ClientOptions) => {
  const opts = {
    ...options,
    env: options?.env ?? "local",
  };
  const identifier = await signer.getIdentifier();
  return Client.create(signer, testEncryptionKey, {
    ...opts,
    disableAutoRegister: true,
    dbPath: opts.dbPath ?? `./test-${identifier.identifier}.db3`,
  });
};

export const createRegisteredClient = async (
  signer: Signer,
  options?: ClientOptions,
) => {
  const opts = {
    ...options,
    env: options?.env ?? "local",
  };
  const identifier = await signer.getIdentifier();
  return Client.create(signer, testEncryptionKey, {
    ...opts,
    dbPath: opts.dbPath ?? `./test-${identifier.identifier}.db3`,
  });
};

export const ContentTypeTest = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "test",
  versionMajor: 1,
  versionMinor: 0,
});

export class TestCodec implements ContentCodec {
  get contentType(): ContentTypeId {
    return ContentTypeTest;
  }

  encode(content: Record<string, string>) {
    return {
      type: this.contentType,
      parameters: {},
      content: new TextEncoder().encode(JSON.stringify(content)),
    };
  }

  decode(content: EncodedContent) {
    const decoded = new TextDecoder().decode(content.content);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(decoded);
  }

  fallback() {
    return undefined;
  }

  shouldPush() {
    return false;
  }
}
