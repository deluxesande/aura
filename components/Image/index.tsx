"use client";
import React from "react";
import { IKImage } from "imagekitio-next";
import { pathToFileURL } from "url";

interface ImageKitImageProps {
    path: string;
    height?: string;
    width?: string;
    alt?: string;
    className?: string;
}

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const cleanPath = (path: string): string => {
    // Remove protocol and domain if present
    const urlPattern = /^(https?:\/\/[^\/]+)/;
    const cleanedPath = path.replace(urlPattern, "");

    // Remove leading slashes
    return cleanedPath.replace(/^\//, "");
};

const Image: React.FC<ImageKitImageProps> = ({
    path,
    height = "300",
    width = "300",
    alt = "Image",
    className = "object-cover w-full h-full rounded-lg",
}) => {
    const cleanedPath = cleanPath(path);

    return (
        <IKImage
            urlEndpoint={urlEndpoint}
            path={path}
            transformation={[{ height, width }]}
            alt={alt}
            className={className}
            loading="lazy"
        />
    );
};

export default Image;
