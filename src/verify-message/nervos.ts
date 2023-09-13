import type { Hex } from "viem";

/**
 * @see https://github.com/dotbitHQ/das-multi-device/blob/main/API.md
 */
export async function verifyNervosMessage(
  address: string,
  message: string,
  signature: Hex
) {
  const endpoint = address.startsWith("ckb1")
    ? "https://webauthn-api.did.id"
    : "https://test-webauthn-api.did.id";
  const info = await rpcCall<{ ckb_address: string[] }>(
    `${endpoint}/v1/webauthn/authorize-info`,
    { ckb_address: address }
  );
  return (
    await Promise.all(
      [address, ...info.ckb_address].map(async (master_addr) => {
        try {
          const { is_valid } = await rpcCall<{ is_valid: boolean }>(
            `${endpoint}/v1/webauthn/verify`,
            {
              master_addr,
              backup_addr: address,
              msg: message,
              signature: signature.replace(/^0x/, ""),
            }
          );
          return is_valid;
        } catch (err) {
          console.error(err);
          return false;
        }
      })
    )
  ).some((is_valid) => is_valid);
}

async function rpcCall<T>(url: string, json: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(json),
  });
  if (response.ok) {
    const json = (await response.json()) as {
      err_no: number;
      err_msg: string;
      data: T;
    };
    if (json.err_no !== 0) {
      throw new Error(json.err_msg);
    }
    return json.data;
  }
  throw new Error(response.statusText);
}
