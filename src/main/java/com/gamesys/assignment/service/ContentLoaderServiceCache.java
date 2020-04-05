package com.gamesys.assignment.service;

import com.gamesys.assignment.exception.ErrorCode;
import com.gamesys.assignment.exception.ExtendedException;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import static com.gamesys.assignment.service.ContentLoaderService.PARTIALS_EXTENSION;
import static com.gamesys.assignment.service.ContentLoaderService.PARTIALS_BASE_PATH;

public final class ContentLoaderServiceCache {

    private ContentLoaderServiceCache() {}

    private static Map<String,String> cache = new HashMap<>();

    private static String fetchCache(String partial) {
        return cache.getOrDefault(partial, null);
    }

    private static void putCache(String partial, String content) {
        cache.put(partial, content);
    }

    private static boolean hasCache(String partial) {
        return cache.containsKey(partial);
    }

    private static String generatePath(String partial) {

        String filename = partial.concat(PARTIALS_EXTENSION);
        return PARTIALS_BASE_PATH.concat(filename);

    }

    private static File fetchFile(String partial) throws ExtendedException {

        ClassLoader classLoader = ClassLoader.getSystemClassLoader();
        String path = generatePath(partial);
        URL resource = classLoader.getResource(path);

        if (resource == null) {
            throw new ExtendedException(ErrorCode.FILE_NOT_FOUND);
        } else {
            return new File(resource.getFile());
        }

    }

    private static String fetchFileContent(String partial) throws ExtendedException {

        File partialFile = fetchFile(partial);
        Path partialPath = partialFile.toPath();
        String content = "";

        try {
            content = Files.readString(partialPath, StandardCharsets.UTF_8);
        } catch(Exception e) {
            e.printStackTrace();
            throw new ExtendedException(ErrorCode.FILE_READ_ISSUE, e);
        }

        if (content.isEmpty()) {
            throw new ExtendedException(ErrorCode.FILE_IS_EMPTY);
        } else {
            return content;
        }

    }

    public static synchronized String fetchContent(String partial) throws ExtendedException {

        String content = "";

        if(hasCache(partial)) {
            content = fetchCache(partial);
        } else {
            content = fetchFileContent(partial);
            putCache(partial, content);
        }

        return content;

    }

}
