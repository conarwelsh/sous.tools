package com.sous.wearos.voice

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.sous.wearos.theme.SousTheme

class VoiceInputActivity : ComponentActivity() {
    private val SPEECH_REQUEST_CODE = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        displaySpeechRecognizer()
    }

    private fun displaySpeechRecognizer() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        }
        startActivityForResult(intent, SPEECH_REQUEST_CODE)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == SPEECH_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            val spokenText: String? = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.let {
                it[0]
            }
            // Process the spoken text
            // For now, we'll just finish the activity
            finish()
        } else {
            super.onActivityResult(requestCode, resultCode, data)
            finish()
        }
    }
}
