import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const id=req.nextUrl.searchParams.get("id");
    if(!id){
        return NextResponse.json({messs:"No id found"});
    }
    return NextResponse.json({studentId:id});  
}

