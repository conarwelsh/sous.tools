package com.sous.tools;

import android.content.Context;
import android.hardware.display.DisplayManager;
import android.os.Bundle;
import android.view.Display;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.sous.tools.SousPresentation;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Bridge is ready after super.onCreate
        registerRemoteBridge();
    }

    private void registerRemoteBridge() {
        // Setup Native Redirect for development
        final String hostIp = getString(R.string.sous_host_ip);
        final String flavor = getString(R.string.sous_flavor);
        
        // Map flavors to their dev ports
        String port = "3000";
        // All flavors use port 3000 now via Next.js
        final String targetPort = port;

        if (hostIp != null && !hostIp.isEmpty() && !hostIp.equals("10.0.2.2")) {
            this.getBridge().getWebView().setWebViewClient(new BridgeWebViewClient(this.getBridge()) {
                @Override
                public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                    super.onPageStarted(view, url, favicon);
                    view.evaluateJavascript("window.sous_host_ip = '" + hostIp + "';", null);
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    view.evaluateJavascript("window.sous_host_ip = '" + hostIp + "';", null);
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    // Catch ANY localhost attempt and force to WSL
                    if (url.contains("localhost")) {
                        String newUrl = url.replace("localhost:3000", hostIp + ":3000")
                                           .replace("localhost:1423", hostIp + ":3000")
                                           .replace("localhost:1424", hostIp + ":3000")
                                           .replace("localhost:1425", hostIp + ":3000")
                                           .replace("localhost:4000", hostIp + ":4000");
                        
                        // Fallback if port wasn't explicitly in the localhost string
                        if (newUrl.contains("localhost")) {
                             newUrl = newUrl.replace("localhost", hostIp + ":" + targetPort);
                        }

                        android.util.Log.e("MainActivity", "NATIVE_REDIRECT: " + url + " -> " + newUrl);
                        view.evaluateJavascript("window.sous_host_ip = '" + hostIp + "';", null);
                        view.loadUrl(newUrl);
                        return true;
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }
            });
            
            // Proactively check current URL and redirect if it's already localhost
            String currentUrl = this.getBridge().getWebView().getUrl();
            if (currentUrl != null && currentUrl.contains("localhost")) {
                String newUrl = currentUrl.replace("localhost:3000", hostIp + ":3000")
                                           .replace("localhost:1423", hostIp + ":3000")
                                           .replace("localhost:1424", hostIp + ":3000")
                                           .replace("localhost:1425", hostIp + ":3000")
                                           .replace("localhost:4000", hostIp + ":4000");
                this.getBridge().getWebView().loadUrl(newUrl);
            }
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        // Auto-project to secondary displays if present
        projectToSecondaryDisplays();
    }

    private void projectToSecondaryDisplays() {
        DisplayManager displayManager = (DisplayManager) this.getSystemService(Context.DISPLAY_SERVICE);
        Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);
        
        String hostIp = getString(R.string.sous_host_ip);
        if (hostIp == null || hostIp.isEmpty()) {
            hostIp = "10.0.2.2"; // Fallback to Android Host IP
        }

        String flavor = getString(R.string.sous_flavor);
        if (flavor == null || flavor.isEmpty()) {
            flavor = "tools";
        }

        // Map flavors to their dev ports
        String port = "3000";
        // All flavors use port 3000 now

        for (Display display : displays) {
            // Construct route based on flavor
            String route = "/" + flavor + "/default";
            if (flavor.equals("tools")) route = "/dashboard";
            
            // Append displayId to the URL so the web app knows which screen it is
            String uniqueUrl = "http://" + hostIp + ":" + port + route + "?displayId=" + display.getDisplayId();
            android.util.Log.e("MainActivity", "PROJECTING_TO: " + uniqueUrl);
            SousPresentation p = new SousPresentation(this, display, uniqueUrl);
            p.show();
        }
    }
}