"use client"

import React, { useState, useEffect } from 'react'
import { AnimatedCounter } from './AnimatedCounter'
import { AnimatedProgressBar } from './AnimatedProgressBar'
import { AnimatedTimelineItem } from './AnimatedTimelineItem'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export const AnimationTestPage: React.FC = () => {
  const [counterValue, setCounterValue] = useState(0)
  const [progressValue, setProgressValue] = useState(0)
  const [timelineItems, setTimelineItems] = useState([
    { id: 1, text: "Project started", timestamp: "2 hours ago", status: 'success' as const },
    { id: 2, text: "First milestone reached", timestamp: "1 hour ago", status: 'info' as const },
    { id: 3, text: "Team meeting scheduled", timestamp: "30 min ago", status: 'warning' as const }
  ])

  // Auto-increment counter for testing
  useEffect(() => {
    const interval = setInterval(() => {
      setCounterValue(prev => prev + Math.floor(Math.random() * 10) + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-increment progress for testing
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressValue(prev => Math.min(prev + Math.floor(Math.random() * 20) + 5, 100))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const addTimelineItem = () => {
    const newItem = {
      id: Date.now(),
      text: `New activity ${timelineItems.length + 1}`,
      timestamp: "Just now",
      status: 'default' as const
    }
    setTimelineItems(prev => [newItem, ...prev])
  }

  const resetValues = () => {
    setCounterValue(0)
    setProgressValue(0)
    setTimelineItems([
      { id: 1, text: "Project started", timestamp: "2 hours ago", status: 'success' as const },
      { id: 2, text: "First milestone reached", timestamp: "1 hour ago", status: 'info' as const },
      { id: 3, text: "Team meeting scheduled", timestamp: "30 min ago", status: 'warning' as const }
    ])
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎨 Animation Foundation Test</h1>
        <p className="text-muted-foreground">Testing all foundation animation components</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AnimatedCounter Test */}
        <Card>
          <CardHeader>
            <CardTitle>AnimatedCounter Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <AnimatedCounter 
                value={counterValue}
                showChange={true}
                className="text-2xl"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Auto-incrementing every 3 seconds
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => setCounterValue(prev => prev + 50)}
                variant="outline"
                size="sm"
              >
                +50
              </Button>
              <Button 
                onClick={() => setCounterValue(prev => prev - 25)}
                variant="outline"
                size="sm"
              >
                -25
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AnimatedProgressBar Test */}
        <Card>
          <CardHeader>
            <CardTitle>AnimatedProgressBar Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatedProgressBar 
              value={progressValue}
              label="Project Progress"
              showPercentage={true}
              color="success"
              size="lg"
            />
            <AnimatedProgressBar 
              value={75}
              label="Team Activity"
              showPercentage={true}
              color="info"
              size="md"
            />
            <AnimatedProgressBar 
              value={30}
              label="Tasks Completed"
              showPercentage={true}
              color="warning"
              size="sm"
            />
            <p className="text-sm text-muted-foreground text-center">
              Auto-incrementing every 4 seconds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AnimatedTimelineItem Test */}
      <Card>
        <CardHeader>
          <CardTitle>AnimatedTimelineItem Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={addTimelineItem} size="sm">
                Add Timeline Item
              </Button>
              <Button onClick={resetValues} variant="outline" size="sm">
                Reset All
              </Button>
            </div>
            
            <div className="space-y-2">
              {timelineItems.map((item, index) => (
                <AnimatedTimelineItem
                  key={item.id}
                  delay={index * 100}
                  animation="slideIn"
                  isNew={index === 0}
                  isRecent={index < 2}
                  status={item.status}
                  timestamp={item.timestamp}
                  icon={
                    item.status === 'success' ? '✅' :
                    item.status === 'warning' ? '⚠️' :
                    item.status === 'info' ? 'ℹ️' : '📝'
                  }
                >
                  <div className="font-medium">{item.text}</div>
                </AnimatedTimelineItem>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Info */}
      <Card>
        <CardHeader>
          <CardTitle>Performance & Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">AnimatedCounter</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Smooth number transitions</li>
                <li>• Change indicators (+/-)</li>
                <li>• Number formatting (K, M)</li>
                <li>• Configurable duration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AnimatedProgressBar</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Smooth progress animation</li>
                <li>• Color coding by status</li>
                <li>• Multiple sizes (sm, md, lg)</li>
                <li>• Percentage display</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AnimatedTimelineItem</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Slide-in animations</li>
                <li>• Status indicators</li>
                <li>• New item highlights</li>
                <li>• Recent activity pulse</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnimationTestPage
