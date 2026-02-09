package com.sous.tools;

import android.content.Context;
import android.hardware.display.DisplayManager;
import android.view.Display;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "SousHardware")
public class SousHardwarePlugin extends Plugin {

    private List<SousPresentation> presentations = new ArrayList<>();

    @PluginMethod
    public void getFlavor(PluginCall call) {
        String flavor = getContext().getString(R.string.sous_flavor);
        JSObject ret = new JSObject();
        ret.put("value", flavor);
        call.resolve(ret);
    }

    @PluginMethod
    public void projectToHDMI(PluginCall call) {
        String url = call.getString("url");
        if (url == null) {
            call.reject("URL is required");
            return;
        }

        getBridge().getActivity().runOnUiThread(() -> {
            DisplayManager displayManager = (DisplayManager) getContext().getSystemService(Context.DISPLAY_SERVICE);
            Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);

            if (displays.length > 0) {
                // Clear existing presentations
                for (SousPresentation p : presentations) {
                    p.dismiss();
                }
                presentations.clear();

                // Project to ALL connected displays
                for (Display display : displays) {
                    SousPresentation p = new SousPresentation(getContext(), display, url);
                    p.show();
                    presentations.add(p);
                }
                call.resolve();
            } else {
                call.reject("No secondary displays found");
            }
        });
    }
}
