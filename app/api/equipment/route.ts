import { NextResponse } from "next/server";

let equipmentStore: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.category || !body.quantity) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newEquipment = {
      id: Date.now(),
      name: body.name,
      serialNumber: body.serialNumber || "",
      category: body.category,
      quantity: Number(body.quantity),
      unit: body.unit || "pieces",
      condition: body.condition || "good",
      location: body.location || "unknown",
      createdAt: new Date().toISOString(),
    };

    equipmentStore.push(newEquipment);

    return NextResponse.json(
      { message: "Equipment added", equipment: newEquipment },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/equipment error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(equipmentStore);
}