import configPromise from "@payload-config";
import { createPayloadRequest, getPayload } from "payload";

export const dynamic = "force-dynamic";

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const req = await createPayloadRequest({
    config: configPromise,
    request
  });
  const payload = await getPayload({ config: configPromise });
  const data = await request.json().catch(() => ({}));

  try {
    const result = await payload.update({
      collection: "annuaire",
      id,
      data,
      req
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enregistrement impossible.";
    return Response.json({ message }, { status: 400 });
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const req = await createPayloadRequest({
    config: configPromise,
    request
  });
  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.delete({
      collection: "annuaire",
      id,
      req
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Suppression impossible.";
    return Response.json({ message }, { status: 400 });
  }
};
