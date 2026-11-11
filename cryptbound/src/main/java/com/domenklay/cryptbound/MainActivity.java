package com.domenklay.cryptbound;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.view.View;

public class MainActivity extends Activity {
    private WebView view;
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().setStatusBarColor(Color.rgb(13, 9, 11));
        getWindow().setNavigationBarColor(Color.rgb(13, 9, 11));
        view = new WebView(this);
        view.setBackgroundColor(Color.rgb(13, 9, 11));
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
        view.setWebViewClient(new WebViewClient());
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setDefaultTextEncodingName("UTF-8");
        setContentView(view);
        view.loadUrl("file:///android_asset/index.html");
    }
    @Override protected void onPause() {
        if (view != null) view.evaluateJavascript("window.Crypt && window.Crypt.save()", null);
        super.onPause();
    }
    @Override public void onBackPressed() {
        if (view != null) view.evaluateJavascript("window.Crypt && window.Crypt.back()", null);
    }
    @Override protected void onDestroy() {
        if (view != null) {view.destroy(); view = null;}
        super.onDestroy();
    }
}
