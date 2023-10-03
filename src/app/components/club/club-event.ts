export class ClubEvent {
  readonly clubId?: number;

  constructor(clubId?: number) {
    this.clubId = clubId;
  }
}

export class ClubDeletedEvent extends ClubEvent {
  constructor(clubId?: number) {
    super(clubId);
  }
}
