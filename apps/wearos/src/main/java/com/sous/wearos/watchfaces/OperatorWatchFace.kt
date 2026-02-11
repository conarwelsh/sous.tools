package com.sous.wearos.watchfaces

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Text
import androidx.wear.watchface.ComplicationSlotsManager
import androidx.wear.watchface.ComposingWatchFaceService
import androidx.wear.watchface.WatchState
import androidx.wear.watchface.complications.ComplicationSlotBounds
import androidx.wear.watchface.complications.DefaultComplicationDataSourcePolicy
import androidx.wear.watchface.complications.SystemDataSources
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.ComplicationSlot
import com.sous.wearos.theme.SousTheme
import java.time.ZonedDateTime
import androidx.wear.compose.material.MaterialTheme

class OperatorWatchFaceService : ComposingWatchFaceService() {

    override fun createComplicationSlotsManager(watchState: WatchState): ComplicationSlotsManager {
        val defaultDataSourcePolicy = DefaultComplicationDataSourcePolicy(SystemDataSources.NO_DATA_SOURCE)
        
        val topLeftComplication = ComplicationSlot.Builder(
            ComplicationSlotBounds(RectF(0.2f, 0.2f, 0.4f, 0.4f)),
            ComplicationType.SHORT_TEXT,
            defaultDataSourcePolicy
        ).build()

        val topRightComplication = ComplicationSlot.Builder(
            ComplicationSlotBounds(RectF(0.6f, 0.2f, 0.8f, 0.4f)),
            ComplicationType.SHORT_TEXT,
            defaultDataSourcePolicy
        ).build()

        val bottomComplication = ComplicationSlot.Builder(
            ComplicationSlotBounds(RectF(0.3f, 0.7f, 0.7f, 0.9f)),
            ComplicationType.LONG_TEXT,
            defaultDataSourcePolicy
        ).build()

        val voiceComplication = ComplicationSlot.Builder(
            ComplicationSlotBounds(RectF(0.4f, 0.4f, 0.6f, 0.6f)),
            ComplicationType.TAP_ACTION,
            DefaultComplicationDataSourcePolicy(
                SystemDataSources.NO_DATA_SOURCE,
                SystemDataSources.NO_DATA_SOURCE
            )
        ).build()

        return ComplicationSlotsManager(
            listOf(topLeftComplication, topRightComplication, bottomComplication, voiceComplication)
        )
    }

    @Composable
    override fun ScopedComposable(
        watchState: WatchState,
        complicationSlotsManager: ComplicationSlotsManager,
        zonedDateTime: ZonedDateTime
    ) {
        SousTheme {
            OperatorWatchFace(
                hour = zonedDateTime.hour,
                minute = zonedDateTime.minute
            )
        }
    }
}

@Composable
fun OperatorWatchFace(hour: Int, minute: Int) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = String.format("%02d:%02d", hour, minute),
            style = MaterialTheme.typography.display1
        )
    }
}
