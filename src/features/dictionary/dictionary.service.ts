import { Injectable } from '@nestjs/common';

@Injectable()
export class DictionaryService {
  async areSynonyms(word1: string, word2: string): Promise<boolean> {
    return word1.toLowerCase() === word2.toLowerCase();
  }
}
