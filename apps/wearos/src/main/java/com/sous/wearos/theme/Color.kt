package com.sous.wearos.theme

import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors

val SousPrimary = Color(0xFF5B6FF4)
val SousPrimaryVariant = Color(0xFF7B7D85) // Muted
val SousBackground = Color(0xFF1A1C26)
val SousForeground = Color(0xFFF5F6FC)
val SousSuccess = Color(0xFF00B887)
val SousWarning = Color(0xFFFFB347)
val SousDestructive = Color(0xFFF45B5B)

internal val wearColorPalette: Colors = Colors(
    primary = SousPrimary,
    primaryVariant = SousPrimaryVariant,
    background = SousBackground,
    surface = SousBackground,
    onPrimary = SousForeground,
    onBackground = SousForeground,
    onSurface = SousForeground,
    onSurfaceVariant = SousPrimaryVariant,
    error = SousDestructive,
    onError = SousForeground
)
