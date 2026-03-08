package example.training.actors

import akka.actor.{Actor, Props}
import example.training.Enrollment

object NotificationActor {
  def props(): Props = Props(new NotificationActor)

  final case class SendEnrollmentNotice(enrollment: Enrollment)
}

final class NotificationActor extends Actor {
  import NotificationActor._

  def receive: Receive = {
    case SendEnrollmentNotice(enrollment) =>
      println(s"[notify] Enrollment confirmed: $enrollment")
  }
}
