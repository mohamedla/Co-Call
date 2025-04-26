import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';
import { VideoComponent } from './pages/video/video.component';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent,
  },
  {
    path: 'chat',
    component: ChatComponent,
  },
  {
    path: 'video',
    component: VideoComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
