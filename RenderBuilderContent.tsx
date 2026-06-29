"use client";
import { BuilderComponent, useIsPreviewing } from "@builder.io/react";
import DefaultErrorPage from "next/error";

interface BuilderContentProps {
  content: any;
  model: string;
}

export default function RenderBuilderContent({ content, model }: BuilderContentProps) {
  const isPreviewing = useIsPreviewing();

  if (content || isPreviewing) {
    return <BuilderComponent content={content} model={model} />;
  }

  return <DefaultErrorPage statusCode={404} />;
}