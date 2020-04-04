package com.gamesys.assignment.controller;

import com.gamesys.assignment.bean.ApiResponse;
import com.gamesys.assignment.bean.LoadedContent;
import com.gamesys.assignment.exception.ErrorCode;
import com.gamesys.assignment.service.ContentLoaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class IndexController {

    // Routes
    public static final String ROUTE__INDEX = "/";
    public static final String ROUTE__CONTENT = "/api/v1/content/{partial}";

    @Autowired
    private ContentLoaderService contentLoaderService;

    @RequestMapping(value = ROUTE__INDEX)
    public String index() {
        return "index";
    }

    @GetMapping(value = ROUTE__CONTENT, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getContent(@PathVariable String partial) {

        // Load specific content per partial
        LoadedContent loadedPartial = contentLoaderService.fetchPartialContent(partial);
        String content = loadedPartial.getContent();
        ErrorCode loadError = loadedPartial.getError();
        ApiResponse response = new ApiResponse(content, loadError);

        // Handling status codes
        HttpStatus status = HttpStatus.OK;
        if(loadError != null) {
            switch( loadError ) {
                case FILE_NOT_FOUND:
                    status = HttpStatus.NOT_FOUND;
                case FILE_READ_ISSUE:
                    status = HttpStatus.NOT_FOUND;
                    break;
                case FILE_IS_EMPTY:
                    status = HttpStatus.NOT_IMPLEMENTED;
                    break;
                default:
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }

        return ResponseEntity.status(status).body(response);

    }

}