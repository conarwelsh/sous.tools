package com.sous.wearos.theme

import androidx.compose.runtime.Composable
import androidx.wear.compose.material.MaterialTheme

@Composable
fun SousTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colors = wearColorPalette,
        typography = Typography,
        // For shapes, we'll use the default Wear OS shapes.
        content = content
    )
}
