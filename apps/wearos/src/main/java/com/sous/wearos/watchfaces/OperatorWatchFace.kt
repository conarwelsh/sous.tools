package com.sous.wearos.watchfaces

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.view.SurfaceHolder
import androidx.wear.watchface.*
import androidx.wear.watchface.style.*
import java.time.ZonedDateTime

class OperatorWatchFaceService : WatchFaceService() {

    override suspend fun createWatchFace(
        surfaceHolder: SurfaceHolder,
        watchState: WatchState,
        complicationSlotsManager: ComplicationSlotsManager,
        currentUserStyleRepository: CurrentUserStyleRepository
    ): WatchFace {
        val renderer = OperatorRenderer(
            surfaceHolder,
            watchState,
            complicationSlotsManager,
            currentUserStyleRepository
        )
        return WatchFace(
            watchFaceType = WatchFaceType.DIGITAL,
            renderer = renderer
        )
    }
}

class OperatorRenderer(
    surfaceHolder: SurfaceHolder,
    watchState: WatchState,
    complicationSlotsManager: ComplicationSlotsManager,
    currentUserStyleRepository: CurrentUserStyleRepository
) : Renderer.CanvasRenderer2<OperatorRenderer.OperatorSharedAssets>(
    surfaceHolder,
    currentUserStyleRepository,
    watchState,
    CanvasType.HARDWARE,
    16L,
    clearWithBackgroundTintBeforeRenderingHighlightLayer = true
) {
    class OperatorSharedAssets : Renderer.SharedAssets {
        override fun onDestroy() {}
    }

    override suspend fun createSharedAssets(): OperatorSharedAssets = OperatorSharedAssets()

    private val textPaint = Paint().apply {
        isAntiAlias = true
        color = Color.WHITE
        textSize = 50f
        textAlign = Paint.Align.CENTER
    }

    override fun render(
        canvas: Canvas,
        bounds: Rect,
        zonedDateTime: ZonedDateTime,
        sharedAssets: OperatorSharedAssets
    ) {
        canvas.drawColor(Color.BLACK)
        val timeText = String.format("%02d:%02d", zonedDateTime.hour, zonedDateTime.minute)
        canvas.drawText(timeText, bounds.centerX().toFloat(), bounds.centerY().toFloat(), textPaint)
    }

    override fun renderHighlightLayer(
        canvas: Canvas,
        bounds: Rect,
        zonedDateTime: ZonedDateTime,
        sharedAssets: OperatorSharedAssets
    ) {
    }
}
