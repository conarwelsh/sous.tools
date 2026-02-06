package com.sous.wearos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SousWearTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colors.background),
                    contentAlignment = Alignment.Center
                ) {
                    TimeText()
                    Greeting("Chef")
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String) {
    Text(
        modifier = Modifier.fillMaxWidth(),
        textAlign = TextAlign.Center,
        color = MaterialTheme.colors.primary,
        text = "Hello, $name"
    )
}

@Composable
fun SousWearTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = androidx.wear.compose.material.Colors(
            primary = Color(0xFF9868FF), // Sous Primary Purple
            background = Color(0xFF1E1E24), // Sous Dark BG
            surface = Color(0xFF1E1E24),
            onPrimary = Color.White,
            onSurface = Color.White
        ),
        content = content
    )
}
