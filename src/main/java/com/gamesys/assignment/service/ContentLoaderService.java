package com.gamesys.assignment.service;

import com.gamesys.assignment.bean.LoadedContent;

public interface ContentLoaderService {

    static final String NOT_FOUND_PARTIAL = "404";
    static final String PARTIALS_EXTENSION = ".html";
    static final String PARTIALS_BASE_PATH = "templates/partials/";

    public LoadedContent fetchPartialContent(String partial);

}