package com.sous.tools;

import android.app.Presentation;
import android.content.Context;
import android.os.Bundle;
import android.view.Display;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * A Presentation is a special kind of dialog whose purpose is to display
 * content on a secondary display.
 */
public class SousPresentation extends Presentation {

    private String url;
    private WebView webView;

    public SousPresentation(Context outerContext, Display display, String url) {
        super(outerContext, display);
        this.url = url;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Create a WebView to show the signage content
        webView = new WebView(getContext());
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.setWebViewClient(new WebViewClient());

        setContentView(webView);

        if (url != null) {
            webView.loadUrl(url);
        }
    }
}
