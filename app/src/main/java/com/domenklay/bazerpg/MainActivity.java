package com.domenklay.bazerpg;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.view.View;
import android.graphics.Color;

public final class MainActivity extends Activity {
    private WebView web;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(13, 9, 10));
        getWindow().setNavigationBarColor(Color.rgb(11, 8, 8));
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(14, 11, 11));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setWebViewClient(new WebViewClient());
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setDefaultTextEncodingName("UTF-8");
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }
    @Override public void onBackPressed() {
        if (web != null) web.evaluateJavascript(
          "window.Baze && window.Baze.back ? window.Baze.back() : void 0", null);
    }
    @Override protected void onPause() {
        if (web != null) web.evaluateJavascript(
          "window.Baze && window.Baze.save ? window.Baze.save() : void 0", null);
        super.onPause();
    }
    @Override protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
