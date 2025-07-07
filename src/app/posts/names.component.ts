import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  patchState,
  signalState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { NameInterface } from './types/name.interface';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { NamesService } from './services/names.service';

export interface namesStateInterface {
  names: NameInterface[];
  isLoading: boolean;
  error: string | null;
}

export const namesStore = signalStore(
  withState<namesStateInterface>({
    names: [],
    error: null,
    isLoading: false,
  }),
  withComputed((store) => ({
    namesCount: computed(() => store.names().length),
  })),
  withMethods((store, namesService = inject(NamesService)) => ({
    async addName(title: string) {
      const newName: NameInterface = {
        id: crypto.randomUUID(),
        title,
      };
      const updatednames = [...store.names(), newName];
      patchState(store, { names: updatednames });
      await namesService.savenamesToIndexedDB(updatednames);
    },
    async removeName(id: string) {
      const updatednames = store.names().filter((Name) => Name.id !== id);
      patchState(store, { names: updatednames });
      await namesService.savenamesToIndexedDB(updatednames);
    },
    addnames(names: NameInterface[]) {
      patchState(store, { names });
    },
    loadnames: rxMethod<void>(
      pipe(
        switchMap(async () => {
          const savednames = await namesService.loadnamesFromIndexedDB();
          if (savednames) {
            patchState(store, { names: savednames });
          }
        })
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadnames();
    },
  })
);

@Component({
  selector: 'names',
  templateUrl: './names.component.html',
  styleUrls: ['./names.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [namesStore],
})
export class NamesComponent {
  fb = inject(FormBuilder);
  namesService = inject(NamesService);
  store = inject(namesStore);
  addForm = this.fb.nonNullable.group({
    title: '',
  });

  onAdd(): void {
    this.store.addName(this.addForm.getRawValue().title);
    this.addForm.reset();
  }
}
