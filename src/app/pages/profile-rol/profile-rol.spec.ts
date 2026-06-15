import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRol } from './profile-rol';

describe('ProfileRol', () => {
  let component: ProfileRol;
  let fixture: ComponentFixture<ProfileRol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileRol],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileRol);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
