package com.sous.wearos.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Typography

// Note: Ensure that the "Outfit" and "Inter" font families are
// added to the res/font directory. For now, we will use placeholders.

val Typography = Typography(
    display1 = TextStyle(
        fontFamily = FontFamily.Default, // Replace with Outfit
        fontWeight = FontWeight.Bold,
        fontSize = 48.sp
    ),
    title1 = TextStyle(
        fontFamily = FontFamily.Default, // Replace with Outfit
        fontWeight = FontWeight.Normal,
        fontSize = 24.sp
    ),
    body1 = TextStyle(
        fontFamily = FontFamily.Default, // Replace with Inter
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp
    ),
    button = TextStyle(
        fontFamily = FontFamily.Default, // Replace with Outfit
        fontWeight = FontWeight.Bold,
        fontSize = 15.sp,
        letterSpacing = 0.5.sp
    )
)
