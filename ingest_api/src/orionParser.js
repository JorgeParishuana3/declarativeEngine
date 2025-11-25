

export function parseOrionNotification(payload) {
  const subscriptionId = payload.subscriptionId;
  const data = payload.data?.[0];

  if (!data) throw new Error("Invalid Orion notification");

  const parsed = {
    id: data.id,
    type: data.type,
    subscriptionId,
    attributes: {}
  };

  for (const [key, val] of Object.entries(data)) {
    if (key === "id" || key === "type") continue;

    if (val && typeof val === "object" && "value" in val) {
      parsed.attributes[key] = val.value;
    } else {
      parsed.attributes[key] = val;
    }
  }

  return parsed;
}
