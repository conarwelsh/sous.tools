package com.sous.wearos.watchfaces

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Text
import androidx.wear.watchface.ComplicationSlotsManager
import androidx.wear.watchface.DrawMode
import androidx.wear.watchface.RenderParameters
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.rendering.CanvasComplicationDrawable
import androidx.wear.watchface.complications.rendering.ComplicationDrawable
import androidx.wear.watchface.ComposingWatchFaceService
import androidx.wear.watchface.WatchFace
import androidx.wear.watchface.WatchState
import androidx.wear.watchface.complications.ComplicationSlotBounds
import androidx.wear.watchface.complications.DefaultComplicationDataSourcePolicy
import androidx.wear.watchface.complications.SystemDataSources
import androidx.wear.watchface.ComplicationSlot
import com.sous.wearos.theme.SousTheme
import java.time.ZonedDateTime
import androidx.wear.compose.material.MaterialTheme

private const val EXECUTIVE_WATCH_FACE_ID = "ExecutiveWatchFace"

class ExecutiveWatchFaceService : ComposingWatchFaceService() {

    override fun createComplicationSlotsManager(watchState: WatchState): ComplicationSlotsManager {
        val defaultDataSourcePolicy = DefaultComplicationDataSourcePolicy(SystemDataSources.NO_DATA_SOURCE)
        val complicationSlotFactory = ComplicationSlot.Builder(
            ComplicationSlotBounds(RectF(0.2f, 0.7f, 0.4f, 0.9f)),
            ComplicationType.SHORT_TEXT,
            defaultDataSourcePolicy
        )
        return ComplicationSlotsManager(
            listOf(complicationSlotFactory.build())
        )
    }

    @Composable
    override fun ScopedComposable(
        watchState: WatchState,
        complicationSlotsManager: ComplicationSlotsManager,
        zonedDateTime: ZonedDateTime
    ) {
        SousTheme {
            ExecutiveWatchFace(
                hour = zonedDateTime.hour,
                minute = zonedDateTime.minute,
                second = zonedDateTime.second
            )
        }
    }
}

@Composable
fun ExecutiveWatchFace(hour: Int, minute: Int, second: Int) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = String.format("%02d:%02d:%02d", hour, minute, second),
            style = MaterialTheme.typography.display1
        )
    }
}