package com.gamesys.assignment.service;

import com.gamesys.assignment.exception.ExtendedException;

public interface ContentLoaderServiceCache {

    public String fetchContent(String partial) throws ExtendedException;

}