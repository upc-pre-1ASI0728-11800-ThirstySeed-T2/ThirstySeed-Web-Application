import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmsComponent } from './farms';

describe('Farms', () => {
  let component: FarmsComponent;
  let fixture: ComponentFixture<FarmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
