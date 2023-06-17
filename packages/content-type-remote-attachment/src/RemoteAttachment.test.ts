import { Wallet } from "ethers";
import { Client } from "@xmtp/xmtp-js";
import type { Attachment } from "./Attachment";
import { AttachmentCodec } from "./Attachment";
import type { RemoteAttachment } from "./RemoteAttachment";
import {
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from "./RemoteAttachment";

test("content type exists", () => {
  expect(ContentTypeRemoteAttachment.authorityId).toBe("xmtp.org");
  expect(ContentTypeRemoteAttachment.typeId).toBe("remoteStaticAttachment");
  expect(ContentTypeRemoteAttachment.versionMajor).toBe(1);
  expect(ContentTypeRemoteAttachment.versionMinor).toBe(0);
});

test("can create a remote attachment", async () => {
  const aliceWallet = Wallet.createRandom();
  const aliceClient = await Client.create(aliceWallet, { env: "local" });
  aliceClient.registerCodec(new AttachmentCodec());
  aliceClient.registerCodec(new RemoteAttachmentCodec());
  await aliceClient.publishUserContact();

  const bobWallet = Wallet.createRandom();
  const bobClient = await Client.create(bobWallet, { env: "local" });
  bobClient.registerCodec(new AttachmentCodec());
  bobClient.registerCodec(new RemoteAttachmentCodec());
  await bobClient.publishUserContact();

  const conversation = await aliceClient.conversations.newConversation(
    bobWallet.address,
  );

  const attachment: Attachment = {
    filename: "test.txt",
    mimeType: "text/plain",
    data: new TextEncoder().encode("hello world"),
  };
  const encryptedEncodedContent = await RemoteAttachmentCodec.encodeEncrypted(
    attachment,
    new AttachmentCodec(),
  );

  try {
    await fetch("https://localhost/test", {
      method: "POST",
      body: encryptedEncodedContent.payload,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (e) {
    console.error("error fetch", e);
  }

  const remoteAttachment: RemoteAttachment = {
    url: "https://localhost/test",
    contentDigest: encryptedEncodedContent.digest,
    salt: encryptedEncodedContent.salt,
    nonce: encryptedEncodedContent.nonce,
    secret: encryptedEncodedContent.secret,
    scheme: "https",
    contentLength: encryptedEncodedContent.payload.length,
    filename: "test.txt",
  };

  await conversation.send(remoteAttachment, {
    contentType: ContentTypeRemoteAttachment,
  });

  const bobConversation = await bobClient.conversations.newConversation(
    aliceWallet.address,
  );
  const messages = await bobConversation.messages();

  expect(messages.length).toBe(1);

  const message = messages[0];
  const messageContent = message.content as RemoteAttachment;
  expect(messageContent.url).toBe("https://localhost/test");
  expect(messageContent.filename).toBe("test.txt");

  const content: Attachment = await RemoteAttachmentCodec.load(
    messageContent,
    bobClient,
  );
  expect(content.filename).toBe("test.txt");
  expect(content.mimeType).toBe("text/plain");
  expect(content.data).toStrictEqual(new TextEncoder().encode("hello world"));
});

test("fails if url is not https", async () => {
  const aliceWallet = Wallet.createRandom();
  const aliceClient = await Client.create(aliceWallet, { env: "local" });
  aliceClient.registerCodec(new AttachmentCodec());
  aliceClient.registerCodec(new RemoteAttachmentCodec());
  await aliceClient.publishUserContact();

  const bobWallet = Wallet.createRandom();
  const bobClient = await Client.create(bobWallet, { env: "local" });
  bobClient.registerCodec(new AttachmentCodec());
  bobClient.registerCodec(new RemoteAttachmentCodec());
  await bobClient.publishUserContact();

  const conversation = await aliceClient.conversations.newConversation(
    bobWallet.address,
  );

  const attachment: Attachment = {
    filename: "test.txt",
    mimeType: "text/plain",
    data: new TextEncoder().encode("hello world"),
  };
  const encryptedEncodedContent = await RemoteAttachmentCodec.encodeEncrypted(
    attachment,
    new AttachmentCodec(),
  );

  const remoteAttachment: RemoteAttachment = {
    url: "http://localhost/test", // We didn't upload this, but it doesn't matter
    contentDigest: encryptedEncodedContent.digest,
    salt: encryptedEncodedContent.salt,
    nonce: encryptedEncodedContent.nonce,
    secret: encryptedEncodedContent.secret,
    scheme: "https",
    contentLength: encryptedEncodedContent.payload.length,
    filename: "test.txt",
  };

  await expect(
    conversation.send(remoteAttachment, {
      contentType: ContentTypeRemoteAttachment,
    }),
  ).rejects.toThrow("scheme must be https");
});

test("fails if content digest does not match", async () => {
  const aliceWallet = Wallet.createRandom();
  const aliceClient = await Client.create(aliceWallet, { env: "local" });
  aliceClient.registerCodec(new AttachmentCodec());
  aliceClient.registerCodec(new RemoteAttachmentCodec());
  await aliceClient.publishUserContact();

  const bobWallet = Wallet.createRandom();
  const bobClient = await Client.create(bobWallet, { env: "local" });
  bobClient.registerCodec(new AttachmentCodec());
  bobClient.registerCodec(new RemoteAttachmentCodec());
  await bobClient.publishUserContact();

  const conversation = await aliceClient.conversations.newConversation(
    bobWallet.address,
  );

  const attachment: Attachment = {
    filename: "test.txt",
    mimeType: "text/plain",
    data: new TextEncoder().encode("hello world"),
  };
  const encryptedEncodedContent = await RemoteAttachmentCodec.encodeEncrypted(
    attachment,
    new AttachmentCodec(),
  );

  try {
    await fetch("https://localhost/test", {
      method: "POST",
      body: encryptedEncodedContent.payload,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (e) {
    console.error("error fetch", e);
  }

  const remoteAttachment: RemoteAttachment = {
    url: "https://localhost/test",
    contentDigest: encryptedEncodedContent.digest,
    salt: encryptedEncodedContent.salt,
    nonce: encryptedEncodedContent.nonce,
    secret: encryptedEncodedContent.secret,
    scheme: "https",
    contentLength: encryptedEncodedContent.payload.length,
    filename: "test.txt",
  };

  await conversation.send(remoteAttachment, {
    contentType: ContentTypeRemoteAttachment,
  });

  const bobConversation = await bobClient.conversations.newConversation(
    aliceWallet.address,
  );
  const messages = await bobConversation.messages();
  const message = messages[0];

  const encryptedEncoded2 = await RemoteAttachmentCodec.encodeEncrypted(
    attachment,
    new AttachmentCodec(),
  );
  await fetch("https://localhost/test", {
    method: "POST",
    body: encryptedEncoded2.payload,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  await expect(
    RemoteAttachmentCodec.load(message.content as RemoteAttachment, bobClient),
  ).rejects.toThrow("content digest does not match");
});
